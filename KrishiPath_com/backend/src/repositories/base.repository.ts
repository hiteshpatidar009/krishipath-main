import type { FilterQuery, Model, UpdateQuery } from 'mongoose';

export class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}
  find(filter: FilterQuery<T>, page = 1, limit = 20) { return this.model.find(filter).skip((page - 1) * limit).limit(limit); }
  findOne(filter: FilterQuery<T>) { return this.model.findOne(filter); }
  create(data: Partial<T>) { return this.model.create(data); }
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>) { return this.model.findOneAndUpdate(filter, update, { new: true, runValidators: true }); }
}
