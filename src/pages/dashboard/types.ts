export type User = {
    accID: number;
    name: string;
    icons: number[];
    colors: number[];
    hasGlow: boolean;
    perms: number;
    perfs?: PlayerPerf[];
    history?: SEData[];
    private?: boolean;
};

export type SEData = {
    id: number;
    season: number;
    ranks?: RankData[];
    stats: unknown;
    userId: number;
    user?: User;
};

export type Season = {
    id: number;
    name: string | null;
    startTime: string;
    endTime: string;
    createdAt: string;
};

export type QueueOptions = {
    qid: string;
    matchSize: number;
    difficultyMin?: number;
    difficultyMax?: number;
    startingMargin?: number;
    marginIncrement?: number;
    maxMargin?: number;
};

export type AllowedMod = {
    modID: string;
    version: string;
    hash: string;
};

export type BannedMod = {
    id: number;
    modID: string;
    version: string | null;
    options: unknown;
};

export type RankData = {
    id: number;
    qid: string;
    rating: number;
    peak: number;
    places?: PlayerPerf[];
    seDataId: number;
    seData?: SEData;
};

export type PlayerPerf = {
    id: number;
    place: number;
    won: boolean;
    specific: unknown;
    userId: number;
    user?: User;
    gameId: number;
    game?: Game;
    rankDataId?: number | null;
    rankData?: RankData | null;
};

export type Game = {
    id: number;
    played: string;
    perfs?: PlayerPerf[];
    matchId: number;
    match?: Match;
    data: unknown;
};

export type Match = {
    id: number;
    mode: string;
    type: number;
    levelId: number;
    level?: Level;
    games?: Game[];
};

export type Level = {
    id: number;
    games?: Match[];
    name: string;
    author: string;
    diff: number;
    rarity: number;
};

export type Article = {
    id: number;
    title: string;
    content: string;
    category: string;
    createdAt: string;
    updatedAt: string;
};