export interface Changelist
{
    version: string;
    changes: string[];
    name: string;
    label: string;
    value: string;
}

export interface ResponseObject
{
    name: string;
    id: string;
    value: string;
}
