import { FormController } from "../src/forms/FormController";
import { EmailValidation, RequiredValidation } from "../src/forms/validation";
import { Router } from "../src/router/Router";
import { bindText } from "../src/utils/bind";
import { Observable } from "../src/core/observer";

describe("Router", () => {
  test("navigates and resolves params", () => {
    const router = new Router([
      { path: "/", label: "Home" },
      { path: "/tasks/:taskId", label: "Detail" },
    ]);

    const received: string[] = [];
    const unsubscribe = router.subscribe((route) => received.push(route.path));

    router.navigate("/tasks/4");

    expect(router.getCurrentRoute().params.taskId).toBe("4");
    expect(received.at(-1)).toBe("/tasks/4");

    unsubscribe();
  });

  test("reacts to popstate when started", () => {
    const router = new Router([{ path: "/", label: "Home" }]);
    const callback = vi.fn();

    router.subscribe(callback);
    router.start();
    history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
    router.stop();

    expect(callback).toHaveBeenCalled();
  });
});

describe("FormController", () => {
  test("updates values and validates fields", () => {
    const controller = new FormController(
      { email: "", name: "" },
      {
        email: [new RequiredValidation(), new EmailValidation()],
        name: [new RequiredValidation()],
      },
    );

    const input = document.createElement("input");
    const unsubscribe = controller.bindInput("email", input);

    input.value = "test@example.com";
    input.dispatchEvent(new Event("input"));
    controller.setValue("name", "Alice");

    expect(controller.getValues()).toEqual({
      email: "test@example.com",
      name: "Alice",
    });
    expect(controller.validateField("email")).toBe(true);
    expect(controller.validateAll()).toBe(true);

    unsubscribe();
  });

  test("publishes errors and supports setValues", () => {
    const controller = new FormController(
      { email: "" },
      { email: [new RequiredValidation(), new EmailValidation()] },
    );
    const callback = vi.fn();

    controller.subscribeErrors(callback);
    controller.setValues({ email: "bad" });
    controller.validateAll();

    expect(controller.getErrors().email.length).toBe(1);
    expect(callback).toHaveBeenCalled();
  });
});

describe("bindText", () => {
  test("binds an observable to text content", () => {
    const observable = new Observable<number>(1);
    const element = document.createElement("div");
    const unsubscribe = bindText(observable, element);

    observable.next(2);
    unsubscribe();

    expect(element.textContent).toBe("2");
  });
});
