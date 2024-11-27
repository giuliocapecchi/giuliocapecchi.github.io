export interface Project {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
}

export interface ThreeSceneProp {
    velocity: number;
}