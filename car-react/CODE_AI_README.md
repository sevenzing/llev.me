# Car Game AI Code Runner

This car game now supports custom AI logic written in **TypeScript**! You can write your own `handleNextMove` function to control the car automatically with full type safety and IntelliSense.

## How It Works

1. **Open the Code Editor**: Click the "Code It" button to open the code editor
2. **Write Your Logic**: Implement the `handleNextMove` function with TypeScript
3. **Set a Seed** (Optional): Use the same seed to get reproducible results
4. **Run Your Code**: Click "Run Code" to start the game in auto mode with your AI
5. **Manual Play**: Click "Start" for normal keyboard/mouse gameplay

## Game Modes

- **Manual Mode**: Use arrow keys, WASD, or click/touch to control the car manually
- **Auto Mode**: Your `handleNextMove` function controls the car automatically

## TypeScript Support

The editor now supports TypeScript with:
- **Full type safety** for all parameters and return values
- **IntelliSense** and autocomplete
- **Type definitions** for Player, Obstacle, and Bonus objects
- **Automatic TypeScript stripping** for runtime execution

## API Reference

### `handleNextMove(player: Player, obstacles: Obstacle[], bonuses: Bonus[]): MoveDirection`

This function is called every frame and should return the direction to move the car.

**Type Definitions:**
```typescript
interface Player {
  lane: number;      // Current lane position (0-4)
  x: number;         // X coordinate
  y: number;         // Y coordinate
  width: number;     // Car width
  height: number;    // Car height
}

interface Obstacle {
  lane: number;      // Lane position
  x: number;         // X coordinate
  y: number;         // Y coordinate
  width: number;     // Obstacle width
  height: number;    // Obstacle height
  movingSpeed: number; // Obstacle speed
}

interface Bonus {
  lane: number;      // Lane position
  x: number;         // X coordinate
  y: number;         // Y coordinate
  width: number;     // Bonus width
  height: number;    // Bonus height
  type: 'speedup' | 'shield' | 'vortex'; // Bonus type
  isReversed: boolean; // Whether bonus is negative
}

type MoveDirection = 'left' | 'right' | null;
```

**Returns:** `MoveDirection`
- `'left'`: Move car one lane to the left
- `'right'`: Move car one lane to the right
- `null`: Stay in current lane

## Available Functions

Your code has access to these safe functions:
- `Math.abs()`, `Math.min()`, `Math.max()`, `Math.floor()`, `Math.ceil()`, `Math.round()`, `Math.sqrt()`, `Math.pow()`, `Math.PI`
- `Array.isArray()`
- `console.log()`, `console.warn()`, `console.error()`

## Security

- **Sandboxed Execution**: Your code runs in a restricted environment
- **Timeout Protection**: Code execution is limited to prevent infinite loops
- **Input Validation**: Only safe, serializable data is passed to your function
- **Output Validation**: Return values are validated before being used

## Example Strategies

### Simple Obstacle Avoidance
```javascript
function handleNextMove(player, obstacles, bonuses) {
  const currentLane = player.lane;
  
  // Find obstacles in current lane
  const laneObstacles = obstacles.filter(o => o.lane === currentLane);
  
  if (laneObstacles.length > 0) {
    // Try to move to a safe lane
    if (currentLane > 0) return 'left';
    if (currentLane < 4) return 'right';
  }
  
  return null;
}
```

### Bonus Collection
```javascript
function handleNextMove(player, obstacles, bonuses) {
  // Look for nearby bonuses
  const nearbyBonuses = bonuses.filter(b => 
    b.y > player.y - 50 && b.y < player.y + 100
  );
  
  for (const bonus of nearbyBonuses) {
    if (bonus.lane < player.lane) return 'left';
    if (bonus.lane > player.lane) return 'right';
  }
  
  return null;
}
```

### Advanced Strategy
```javascript
function handleNextMove(player, obstacles, bonuses) {
  const currentLane = player.lane;
  
  // Check if current lane is safe
  const laneObstacles = obstacles.filter(o => 
    o.lane === currentLane && 
    o.y > player.y - 80 && 
    o.y < player.y + 30
  );
  
  if (laneObstacles.length > 0) {
    // Find safest alternative lane
    const leftSafe = currentLane > 0 && !obstacles.some(o => 
      o.lane === currentLane - 1 && 
      o.y > player.y - 80 && 
      o.y < player.y + 30
    );
    
    const rightSafe = currentLane < 4 && !obstacles.some(o => 
      o.lane === currentLane + 1 && 
      o.y > player.y - 80 && 
      o.y < player.y + 30
    );
    
    if (leftSafe) return 'left';
    if (rightSafe) return 'right';
  }
  
  // Collect bonuses if safe
  const nearbyBonuses = bonuses.filter(b => 
    b.y > player.y - 30 && b.y < player.y + 80
  );
  
  for (const bonus of nearbyBonuses) {
    if (bonus.lane < currentLane && currentLane > 0) return 'left';
    if (bonus.lane > currentLane && currentLane < 4) return 'right';
  }
  
  return null;
}
```

## Tips

1. **Use the seed**: Set a specific seed to get reproducible results for testing
2. **Test different strategies**: Try different approaches and see which works best
3. **Consider game speed**: Higher speeds require earlier reactions
4. **Balance safety and scoring**: Avoid obstacles while collecting bonuses
5. **Use console.log()**: Add debugging output to understand what's happening

## Troubleshooting

- **Code not running**: Make sure the game is started and your function is named `handleNextMove`
- **Invalid return value**: Return only `'left'`, `'right'`, or `null`
- **Performance issues**: Keep your logic simple and efficient
- **Unexpected behavior**: Check the browser console for error messages

Happy coding! 🚗💻 