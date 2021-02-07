## Math Arena

### Game Introduction
This game is intended to be a competitive math game. Players are circles which can move around a map and find
larger circles to trigger an equation to appear on the screen. Players must quickly solve the equation to gain points.
Players who don't solve it quick enough run the risk of being knocked out. The person with the highest score when
being knocked out is added to the leaderboard.

#### Game Mechanics (potential)
* game instance is player capped, maybe 20?
* players lose points each second of inactivity
* players with higher points have tougher problems
* players are invulnerable for a period of time when entering a problem circle
* players maybe become vulnerable if they enter an answer incorrectly?
* players are knocked out if entering an answer incorrectly?

#### Installation
```
git clone https://github.com/engineer-man/math-arena
cd math-arena
cp .env.sample .env
cp config.sample.js config.js
docker-compose up
```
