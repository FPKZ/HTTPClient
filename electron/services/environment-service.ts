import { IEnvironmentService } from "../interfaces/environment-service.interface";
import { IEnvironmentRepository } from "../interfaces/environment-repository.interface";

export class EnvironmentService implements IEnvironmentService {
  private repo: IEnvironmentRepository;

  constructor(repo: IEnvironmentRepository) {
    this.repo = repo;
  }

  async createEnvironment(collectionId: string, name: string): Promise<any> {
    return this.repo.create(collectionId, name);
  }

  async updateEnvironment(id: string, updates: { name?: string; variables?: any[] }): Promise<boolean> {
    return this.repo.update(id, updates);
  }

  async deleteEnvironment(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
