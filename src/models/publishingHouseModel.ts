import { prop, getModelForClass, Ref, DocumentType } from '@typegoose/typegoose';
import { Book } from './bookModel';

export interface IPublishingHouse extends DocumentType<PublishingHouse> {
  _id: any;
  name: string;
  books?: Ref<Book>[];
}

export class PublishingHouse {
    @prop({ required: true })
    public name!: string;

    @prop({ ref: () => Book, default: [] })
    public books?: Ref<Book>[];
}

export const PublishingHouseModel = getModelForClass(PublishingHouse);