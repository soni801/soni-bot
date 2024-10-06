import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// noinspection JSUnusedGlobalSymbols
/**
 * Migrates the reminded column of the reminder entity to a superior active model.
 *
 * @author theS1LV3R, Soni
 * @since 6.2.0
 * @see {@link MigrationInterface}
 */
export class remindedToActive1662305752822 implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void>
    {
        if (await queryRunner.hasColumn('reminder', 'reminded'))
        {
            await queryRunner.changeColumn('reminder', 'reminded', new TableColumn({ name: 'active', type: 'boolean', default: true }));
            await queryRunner.query('update reminder set active = not active');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void>
    {
        if (await queryRunner.hasColumn('reminder', 'active'))
        {
            await queryRunner.changeColumn('reminder', 'active', new TableColumn({ name: 'reminded', type: 'boolean', default: false }));
            await queryRunner.query('update reminder set reminded = not reminded');
        }
    }
}
