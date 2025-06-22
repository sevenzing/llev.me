import { GAME_CONFIG, CAR_DIMENSIONS } from '../constants/gameConstants';

export const calculateLaneX = (lane: number): number => {
    return lane * GAME_CONFIG.laneWidth + (GAME_CONFIG.laneWidth - CAR_DIMENSIONS.width) / 2;
}