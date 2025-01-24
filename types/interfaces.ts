export interface Project {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
    created_at: string;
}

export interface ThreeSceneProp {
    velocity: number;
}