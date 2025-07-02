import { GAME_CONFIG, CAR_DIMENSIONS } from "../constants/gameConstants";

export const calculateLaneX = (lane: number, objectWidth: number): number => {
  return (
    lane * GAME_CONFIG.laneWidth + (GAME_CONFIG.laneWidth - objectWidth) / 2
  );
};

export const calculateLaneXForCar = (lane: number): number => {
  return calculateLaneX(lane, CAR_DIMENSIONS.width);
};
