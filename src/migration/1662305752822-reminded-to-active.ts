import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migrates the reminded column of the reminder entity to a superior active model.
 */
export class remindedToActive1662305752822 implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.changeColumn('reminder', 'reminded', new TableColumn({ name: 'active', type: 'boolean', default: true }));
        await queryRunner.query('update reminder set active = not active');
    }

    public async down(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.changeColumn('reminder', 'active', new TableColumn({ name: 'reminded', type: 'boolean', default: false }));
        // noinspection SqlResolve - IntelliJ is being dumb
        await queryRunner.query('update reminder set reminded = not reminded');
    }
}
