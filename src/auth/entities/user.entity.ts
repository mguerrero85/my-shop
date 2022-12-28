import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';



@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text',{
        select: false
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    @BeforeInsert()
    checkFieldsBeforeIsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
       this.checkFieldsBeforeIsert();
    }

}
