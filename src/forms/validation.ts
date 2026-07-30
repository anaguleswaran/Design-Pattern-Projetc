export interface ValidationStrategy {
  validate(value: string): string | null;
}

export class RequiredValidation implements ValidationStrategy {
  private readonly message: string;

  constructor(message = "Ce champ est requis.") {
    this.message = message;
  }

  validate(value: string): string | null {
    return value.trim() ? null : this.message;
  }
}

export class EmailValidation implements ValidationStrategy {
  private readonly message: string;

  constructor(message = "Adresse e-mail invalide.") {
    this.message = message;
  }

  validate(value: string): string | null {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value.trim()) ? null : this.message;
  }
}

export class MinLengthValidation implements ValidationStrategy {
  private readonly minLength: number;
  private readonly message: string;

  constructor(
    minLength: number,
    message = `Nombre minimal de caractères non atteint.`,
  ) {
    this.minLength = minLength;
    this.message = message;
  }

  validate(value: string): string | null {
    return value.trim().length >= this.minLength ? null : this.message;
  }
}

export class PatternValidation implements ValidationStrategy {
  private readonly pattern: RegExp;
  private readonly message: string;

  constructor(
    pattern: RegExp,
    message = "Le format du champ est invalide.",
  ) {
    this.pattern = pattern;
    this.message = message;
  }

  validate(value: string): string | null {
    return this.pattern.test(value.trim()) ? null : this.message;
  }
}
