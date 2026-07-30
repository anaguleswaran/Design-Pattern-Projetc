export type Priorite = "urgente" | "standard" | "faible";

export class Tache {
  title: string;
  description: string;
  priorite: Priorite;
  createdAt: Date;

  constructor(
    title: string,
    description: string,
    priorite: Priorite,
    createdAt: Date = new Date(),
  ) {
    this.title = title;
    this.description = description;
    this.priorite = priorite;
    this.createdAt = createdAt;
  }
}
