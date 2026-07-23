import Group from "./group.model";

class GroupService {
 async createOrUpdate(data: any) {

    const group = await Group.findOne({

        groupId: data.groupId,

    });

    if (group) {

        return group;

    }

    return await Group.create(data);

}

  async getAll() {
    return await Group.find().sort({
      updatedAt: -1,
    });
  }

  async getByGroupId(groupId: string) {
    return await Group.findOne({
      groupId,
    });
  }
}

export default new GroupService();