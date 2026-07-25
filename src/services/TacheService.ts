import { Tache } from "../models/Tache";

export class TacheService {
    private readonly taches: Tache[] = [];

    public create(tache: Tache): void{
        this.taches.push(tache);
    }
    public getAll(): Tache[] {
        return this.taches;
    }

    public update(index: number, tache: Tache): void {
        this.taches[index] = tache;
    }

    public delete(index: number): void {
        this.taches.splice(index, 1);
    }
}
