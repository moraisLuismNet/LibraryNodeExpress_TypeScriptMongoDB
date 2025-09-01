import { prop, getModelForClass, Ref, DocumentType } from '@typegoose/typegoose';
import { Author } from './authorModel';
import { PublishingHouse } from './publishingHouseModel';

export interface IBook extends DocumentType<Book> {
  title: string;
  pages: number;
  price: number;
  photoCover?: string;
  discontinued: boolean;
  author: Ref<Author>;
  publishingHouse: Ref<PublishingHouse>;
  createdAt: Date;
  updatedAt: Date;
}

export class Book {

    @prop({ required: true })
    public title!: string;

    @prop({ required: true, min: 1 })
    public pages!: number;

    @prop({ required: true, min: 0 })
    public price!: number;

    @prop()
    public photoCover?: string;

    @prop({ default: false })
    public discontinued!: boolean;

    @prop({ ref: 'Author', required: true })
    public author!: Ref<Author>;

    @prop({ ref: 'PublishingHouse', required: true })
    public publishingHouse!: Ref<PublishingHouse>;

    @prop({ default: Date.now })
    public createdAt!: Date;

    @prop({ default: Date.now })
    public updatedAt!: Date;
}

export const BookModel = getModelForClass(Book, {
    schemaOptions: {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
});