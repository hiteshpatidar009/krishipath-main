export abstract class BaseRepository<TEntity> {
  protected repositoryName: string;

  protected constructor(repositoryName: string) {
    this.repositoryName = repositoryName;
  }

  public abstract create(entity: TEntity): Promise<void>;
}
