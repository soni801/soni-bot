import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity()
export default class Reminder
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    due: Date;
}
