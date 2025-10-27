import { randomUUID } from 'node:crypto';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomString } from './random-string';

@Entity({ name: 'examples' })
export class Example {
  static create() {
    const output = new Example();
    output.id = randomUUID();
    output.example = randomString(this.getRandomLength());
    return output;
  }

  static getRandomLength(): number {
    return Math.floor(Math.random() * (50 - 10 + 1)) + 10;
  }

  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id: string;

  @Column({ name: 'example', type: 'varchar', length: '50' })
  example: string;
}
