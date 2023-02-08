document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const score = document.getElementById("score");
    score.innerHTML = 0;
    // Audio
    const eatSound = document.getElementById("eat");
    const eatSound_v2 = document.getElementById("eat-v2");

    // Consts
    const GRID_SIZE = 21;
    const EXPANSION_RATE = 1;
    const snakeBody = [
        {x: 11, y: 11},
        {x: 12, y: 11}
    ];
    
    let snakeSpeed = 3;
    let isGameOver = false;
    let newSegments = 0;
    let inputDirection = {x: 0, y: 0};
    let lastInputDirection = {x: 0, y: 0};

    // Snake functions
    const expandSnake = (amount) => {
        newSegments += amount;
    };

    const onSnake = (position, {ignoreHead = false} = {}) => {
        return snakeBody.some((segment, index) => {
            if (ignoreHead && index <= 1) return false;
            return equalPositions(segment, position);
        });
    };

    const equalPositions = (pos1, pos2) => {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    };

    const addSegments = () => {
        for (let i = 0; i < newSegments; i++) {
            snakeBody.push({...snakeBody[snakeBody.length - 1]});
        }

        newSegments = 0;
    };

    const getSnakeHead = () => {
        return snakeBody[0];
    }

    const snakeIntersection = () => {
        return onSnake(getSnakeHead(), {ignoreHead: true});
    }

    // Grid functions

    const getRandomGridPosition = () => {
        return {
            x: Math.floor(Math.random() * GRID_SIZE) + 1,
            y: Math.floor(Math.random() * GRID_SIZE) + 1
        }
    };

    const outsideGrid = (position) => {
        return (
            position.x < 1 || position.x > GRID_SIZE ||
            position.y < 1 || position.y > GRID_SIZE
        )
    };

    // Food functions
    
    const getRandomFoodPosition = () => {
        let newFoodPosition;
        while (!newFoodPosition || onSnake(newFoodPosition)) {
            newFoodPosition = getRandomGridPosition();
        }
        return newFoodPosition;
    };
    let food = getRandomFoodPosition();

    // Input functions

    const getInputDirection = () => {
        lastInputDirection = inputDirection;
        return inputDirection;
    };

    window.addEventListener("keydown", e => {
        switch (e.key) {
            case "ArrowUp":
                if (lastInputDirection.y !== 0) break;
                inputDirection = {x: 0, y: -1};
                break;
            case "ArrowDown":
                if (lastInputDirection.y !== 0) break;
                inputDirection = {x: 0, y: 1};
                break;
            case "ArrowLeft":
                if (lastInputDirection.x !== 0) break;
                inputDirection = {x: -1, y: 0};
                break;
            case "ArrowRight":
                if (lastInputDirection.x !== 0) break;
                inputDirection = {x: 1, y: 0};
                break;
        }
    });

    let lastRenderTime = 0;

    const main = (currentTime) => {
        const backgroundMusic = document.getElementById("background-music");
        const deathMusic = document.getElementById("death");
        if (isGameOver) {
            backgroundMusic.pause();
            deathMusic.play();
            if (confirm("You lost, bitch. ¿wanna play again?")) {
                window.location.reload();
            }
            return;
        };
        window.requestAnimationFrame(main);
        const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
        if (secondsSinceLastRender < 1 / snakeSpeed) return;
        lastRenderTime = currentTime;
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
        backgroundMusic.play();
        if (snakeSpeed < 5) {
            setTimeout(() => {
                snakeSpeed = 15;
            }, 12000);
        }
        update();
        draw();
    };

    window.requestAnimationFrame(main);

    const update = () => {
        // Update snake
        addSegments();
        const inputDirection = getInputDirection();
        for (let i = snakeBody.length - 2; i >= 0; i--) {
            snakeBody[i + 1] = {...snakeBody[i]};
        }

        snakeBody[0].x += inputDirection.x;
        snakeBody[0].y += inputDirection.y;

        // Update food
        if (onSnake(food)) {
            if (Math.floor(Math.random() * 10) > 7) {
                eatSound_v2.play();
            } else {
                eatSound.play();
            }
            snakeSpeed += 0.2;
            score.innerHTML = (snakeBody.length - 1) * 100;
            expandSnake(EXPANSION_RATE);
            food = getRandomFoodPosition();
        }
        deathCheck();
    };

    const draw = () => {
        gameBoard.innerHTML = "";
        // Draw snake
        snakeBody.forEach(segment => {
            const snakeElement = document.createElement("div");
            snakeElement.style.gridRowStart = segment.y;
            snakeElement.style.gridColumnStart = segment.x;
            snakeElement.classList.add("snake");
            gameBoard.appendChild(snakeElement);
        });

        // Draw food
        const foodElement = document.createElement("div");
        foodElement.style.gridRowStart = food.y;
        foodElement.style.gridColumnStart = food.x;
        foodElement.classList.add("food");
        gameBoard.appendChild(foodElement);
    };

    // Check if is dead
    const deathCheck = () => {
        isGameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
    };

});