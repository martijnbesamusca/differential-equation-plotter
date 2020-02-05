import settings from "./store/settings";

export const vert_line_length = 12;
export function vert_line(vertices: Float32Array, startX: number, endX: number, width: number, index_offset: number = 0) {
    // Triangle 1
    vertices[index_offset] = startX + width / 2;
    vertices[index_offset + 1] = settings.window.get('min_y') as number;

    vertices[index_offset + 2] = startX + width / 2;
    vertices[index_offset + 3] = settings.window.get('max_y') as number;

    vertices[index_offset + 4] = startX - width / 2;
    vertices[index_offset + 5] = settings.window.get('min_y') as number;


    // Triangle 2
    vertices[index_offset + 6] = startX + width / 2;
    vertices[index_offset + 7] = settings.window.get('max_y') as number;

    vertices[index_offset + 8] = startX - width / 2;
    vertices[index_offset + 9] = settings.window.get('max_y') as number;

    vertices[index_offset + 10] = startX - width / 2;
    vertices[index_offset + 11] = settings.window.get('min_y') as number;
}
