export interface Command
{
    name: string;
    description: string;
    category: string;
    value?: string;
}

export interface Changelist
{
    version: string;
    changes: string[];
    name: string;
    label: string;
    value: string;
}
