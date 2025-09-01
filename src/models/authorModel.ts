import { prop, getModelForClass, Ref, DocumentType } from '@typegoose/typegoose';
import { Book } from "./bookModel";

export interface IAuthor extends DocumentType<Author> {
  _id: any;
  name: string;
  books?: Ref<Book>[];
}

export class Author {
  @prop({ required: true })
  public name!: string;

  @prop({ ref: () => Book, default: [] })
  public books?: Ref<Book>[];
}

export const AuthorModel = getModelForClass(Author);