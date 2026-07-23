import Message from "./message.model";

class MessageService {

  async save(data: any) {

    const exists = await Message.findOne({
      messageId: data.messageId,
    });

    if (exists) {

      return exists;

    }

    const message = await Message.create(data);

    return message;
  }

  async getLatest(limit = 100) {

    return await Message.find()

      .sort({
        createdAt: -1,
      })

      .limit(limit);

  }

  async getByGroup(groupId: string) {

    return await Message.find({

      groupId,

    })

      .sort({

        createdAt: -1,

      });

  }

  async totalMessages() {

    return await Message.countDocuments();

  }

  async unProcessedMessages() {

    return await Message.find({

      isParsed: false,

    });

  }

}

export default new MessageService();