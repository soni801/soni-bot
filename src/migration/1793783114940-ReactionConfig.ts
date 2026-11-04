import { MigrationInterface, QueryRunner, Table } from 'typeorm';

// noinspection JSUnusedGlobalSymbols
/**
 * Creates the tables used for reaction actions (community mutes and pins).
 * Constraint and index names match the ones TypeORM generates from the entities.
 *
 * @author Soni
 * @since 7.6.0
 * @see {@link MigrationInterface}
 */
export class ReactionConfig1793783114940 implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.createTable(new Table({
            name: 'reaction_action',
            columns: [
                { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment', primaryKeyConstraintName: 'PK_ea177b6e39dbd382f1f4d1a4501' },
                { name: 'message', type: 'varchar' },
                { name: 'action', type: 'varchar' }
            ],
            indices: [
                { name: 'IDX_2a271b4b2e2d0659869c17bc59', columnNames: [ 'message', 'action' ], isUnique: true }
            ]
        }));

        await queryRunner.createTable(new Table({
            name: 'reaction_config',
            columns: [
                { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment', primaryKeyConstraintName: 'PK_a22e074429046e82a5c088d853d' },
                { name: 'guild', type: 'varchar' },
                { name: 'mute_enabled', type: 'boolean' },
                { name: 'mute_emote', type: 'varchar', isNullable: true },
                { name: 'mute_count', type: 'integer' },
                { name: 'mute_minutes', type: 'integer' },
                { name: 'mute_notify', type: 'boolean' },
                { name: 'mute_reason', type: 'varchar', isNullable: true },
                { name: 'pin_enabled', type: 'boolean' },
                { name: 'pin_emote', type: 'varchar', isNullable: true },
                { name: 'pin_count', type: 'integer' },
                { name: 'pin_channel', type: 'varchar', isNullable: true }
            ],
            uniques: [
                { name: 'UQ_a6cffbcb52d6b05cf7c1bed4b0b', columnNames: [ 'guild' ] }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.dropTable('reaction_config');
        await queryRunner.dropTable('reaction_action');
    }
}
