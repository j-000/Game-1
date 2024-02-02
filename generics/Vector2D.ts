export class Vector2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    normalize(): Vector2D {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector2D(0, 0); // Handle zero vector case
        }
        return new Vector2D(this.x / mag, this.y / mag);
    }

    dotProduct(other: Vector2D): number {
        return this.x * other.x + this.y * other.y;
    }

    crossProduct(other: Vector2D): number {
        return this.x * other.y - this.y * other.x;
    }

    distanceTo(other: Vector2D): number {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    angleTo(other: Vector2D): number {
        const dot = this.dotProduct(other);
        const magProduct = this.magnitude() * other.magnitude();
        return Math.acos(dot / magProduct);
    }

    projectOnto(other: Vector2D): Vector2D {
        const mag = other.magnitude();
        const scalarProjection = this.dotProduct(other) / (mag * mag);
        return other.normalize().scale(scalarProjection);
    }

    rotate(angle: number): Vector2D {
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const newX = this.x * cosAngle - this.y * sinAngle;
        const newY = this.x * sinAngle + this.y * cosAngle;
        return new Vector2D(newX, newY);
    }

    perpendicularTo(clockwise: boolean = false): Vector2D {
        const sign = clockwise ? 1 : -1;
        return new Vector2D(-sign * this.y, sign * this.x);
    }

    equals(other: Vector2D): boolean {
        return this.x === other.x && this.y === other.y;
    }

    add(other: Vector2D): Vector2D {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vector2D): Vector2D {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    multiply(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number): Vector2D {
        if (scalar === 0) {
            throw new Error("Division by zero");
        }
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    getAngle(): number {
        return Math.atan2(this.y, this.x);
    }

    getDirection(): Vector2D {
        return this.normalize();
    }

    toArray(): [number, number] {
        return [this.x, this.y];
    }

    scale(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
}