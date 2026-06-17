const slider = document.getElementById("bouncySlider");

let loopMs = 25;
const gravity = 0.4;
let velocity = 0;
let restitution = 0.6;
let held = false;

let lastValue = Number(slider.value);
let lastTime = performance.now();

slider.addEventListener("pointerdown", () => {
    held = true;
    velocity = 0;

    lastValue = Number(slider.value);
    lastTime = performance.now();
});

slider.addEventListener("pointerup", () => {
    held = false;
});

slider.addEventListener("input", () => {
    if (!held) return;

    const now = performance.now();
    const value = Number(slider.value);

    const dt = now - lastTime;

    if (dt > 0) {
        velocity = ((value - lastValue) / dt) * loopMs / 1.25;
    }

    lastValue = value;
    lastTime = now;
});

setInterval(() => {
    if (held) return;

    let value = Number(slider.value);

    velocity -= gravity;
    value += velocity;

    const min = Number(slider.min);
    const max = Number(slider.max);

    if (value <= min || value >= max) {
        value = Math.max(min, Math.min(max, value));

        velocity = -velocity * restitution;

        if (Math.abs(velocity) < 0.1) {
            velocity = 0;
        }
    }

    slider.value = value;
}, loopMs);