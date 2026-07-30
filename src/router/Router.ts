import { Observable } from "../core/observer";

export type RouteParams = Record<string, string>;

export interface RouteDefinition {
  path: string;
  label: string;
}

export interface RouteMatch {
  path: string;
  params: RouteParams;
  definition: RouteDefinition;
}

export class Router {
  private readonly routes: RouteDefinition[];
  private readonly currentRoute: Observable<RouteMatch>;
  private readonly popStateHandler = () => {
    this.currentRoute.next(this.resolve(window.location.pathname));
  };

  constructor(routes: RouteDefinition[]) {
    this.routes = routes;
    this.currentRoute = new Observable<RouteMatch>(
      this.resolve(window.location.pathname),
    );
  }

  start(): void {
    window.addEventListener("popstate", this.popStateHandler);
  }

  stop(): void {
    window.removeEventListener("popstate", this.popStateHandler);
  }

  subscribe(callback: (route: RouteMatch) => void): () => void {
    return this.currentRoute.subscribe(callback);
  }

  getCurrentRoute(): RouteMatch {
    return this.currentRoute.getValue();
  }

  navigate(path: string, replace = false): void {
    const resolved = this.resolve(path);
    if (replace) {
      history.replaceState({}, "", resolved.path);
    } else {
      history.pushState({}, "", resolved.path);
    }
    this.currentRoute.next(resolved);
  }

  private resolve(pathname: string): RouteMatch {
    const cleanedPath = this.normalize(pathname);

    for (const definition of this.routes) {
      const params = this.extractParams(definition.path, cleanedPath);
      if (params !== null) {
        return {
          path: cleanedPath,
          params,
          definition,
        };
      }
    }

    const fallback = this.routes[0];
    return {
      path: fallback.path,
      params: {},
      definition: fallback,
    };
  }

  private normalize(path: string): string {
    if (path.length > 1 && path.endsWith("/")) {
      return path.slice(0, -1);
    }

    return path || "/";
  }

  private extractParams(
    routePath: string,
    currentPath: string,
  ): RouteParams | null {
    const routeParts = this.normalize(routePath).split("/");
    const currentParts = this.normalize(currentPath).split("/");

    if (routeParts.length !== currentParts.length) {
      return null;
    }

    const params: RouteParams = {};

    for (let index = 0; index < routeParts.length; index += 1) {
      const routePart = routeParts[index];
      const currentPart = currentParts[index];

      if (routePart.startsWith(":")) {
        params[routePart.slice(1)] = decodeURIComponent(currentPart);
        continue;
      }

      if (routePart !== currentPart) {
        return null;
      }
    }

    return params;
  }
}
