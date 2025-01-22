// Define the type for the thumbnail object
export interface Thumbnail {
    url: string;
}

// Define the main interface for the game object
export interface Game {
    id: string;
    slug: string;
    title: string;
    providerName: string;
    startUrl?: string; // Optional since it's not in all objects
    thumb: Thumbnail; // Nullable in case no thumbnail is provided
}

// Example of a games array
export type GamesArray = Game[];
