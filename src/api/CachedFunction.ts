import { IViewbox } from "@/store/modules/settings";

export default class CachedFunction {
  private dx: (x: number, y: number) => number;
  private dy: (x: number, y: number) => number;

  private view: IViewbox;
  private width: number;
  private height: number;

  private cache: Float64Array; // Vec4(dx,dy,dz?,exist)

  private dxMin = Number.POSITIVE_INFINITY;
  private dxMax = Number.NEGATIVE_INFINITY;
  private dyMin = Number.POSITIVE_INFINITY;
  private dyMax = Number.NEGATIVE_INFINITY;

  constructor(
    dx: (x: number, y: number) => number,
    dy: (x: number, y: number) => number,
    view: IViewbox,
    width: number,
    height: number
  ) {
    this.dx = dx;
    this.dy = dy;
    this.view = view;
    this.width = width;
    this.height = height;

    this.cache = new Float64Array(this.width * this.height * 4);
    this.generateCache();
  }

  public getdxdy(x: number, y: number): [number, number, boolean] {
    const normX = (x - this.view.x.min) / (this.view.x.max - this.view.x.min);
    const normY = (y - this.view.y.min) / (this.view.y.max - this.view.y.min);
    const index =
      Math.floor(this.width * normX) +
      this.width * Math.floor(this.height * normY);
    return [
      this.cache[index * 4],
      this.cache[index * 4 + 1],
      this.cache[index * 4 + 3] === 1.0
    ];
  }
  public getdxdyInterpolated(x: number, y: number): [number, number] {
    return [x, y];
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public getImage() {
    return Uint8Array.from(this.cache, (value, i) => {
      const id = i % 4;
      if (id === 0) {
        return Math.floor(
          ((value - this.dxMin) / (this.dxMax - this.dxMin)) * 255
        );
      }
      if (id === 1) {
        return Math.floor(
          ((value - this.dyMin) / (this.dyMax - this.dyMin)) * 255
        );
      } else if (id === 2) {
        return 0;
      } else {
        return value * 255;
      }
    });
  }

  private generateCache() {
    for (let i = 0; i < this.width * this.height; i++) {
      const imgX = (i / this.width) % 1;
      const imgY = Math.floor(i / this.width) / this.height;
      const x = this.view.x.min + (this.view.x.max - this.view.x.min) * imgX;
      const y = this.view.y.min + (this.view.y.max - this.view.y.min) * imgY;

      const dx = this.dx(x, y);
      const dy = this.dy(x, y);

      this.cache[i * 4] = Number.isNaN(dx) ? 0 : dx;
      this.cache[i * 4 + 1] = Number.isNaN(dy) ? 0 : dy;
      this.cache[i * 4 + 2] = 0;
      this.cache[i * 4 + 3] = Number.isNaN(dx) || Number.isNaN(dy) ? 0 : 1;
    }

    this.findMinMax();
  }

  private findMinMax() {
    this.dxMin = Number.POSITIVE_INFINITY;
    this.dxMax = Number.NEGATIVE_INFINITY;
    this.dyMin = Number.POSITIVE_INFINITY;
    this.dyMax = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < this.cache.length; i++) {
      const dx = this.cache[i * 4];
      const dy = this.cache[i * 4 + 1];
      if (dx < this.dxMin) {
        this.dxMin = dx;
      }
      if (dx > this.dxMax) {
        this.dxMax = dx;
      }
      if (dy < this.dyMin) {
        this.dyMin = dy;
      }
      if (dy > this.dyMax) {
        this.dyMax = dy;
      }
    }
  }
}
