export interface Command
{
    name: string;
    description: string;
    category: string;
    value?: string;
}

export interface Changelog
{
    version: string;
    changes: string[];
    label?: string;
    value?: string;
}
