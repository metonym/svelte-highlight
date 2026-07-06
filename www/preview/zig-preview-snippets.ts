export type ZigPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const zigPreviewSnippets: ZigPreviewSnippet[] = [
  {
    title: "Main with @import",
    description: "@import, try, and !void",
    code: `const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Hello, {s}!\\n", .{"world"});
}`,
  },
  {
    title: "Comptime struct",
    description: "struct methods and comptime List(T)",
    code: `const Point = struct {
    x: f32,
    y: f32,

    pub fn distance(self: Point, other: Point) f32 {
        const dx = self.x - other.x;
        const dy = self.y - other.y;
        return @sqrt(dx * dx + dy * dy);
    }
};

fn List(comptime T: type) type {
    return struct {
        items: []T,
        len: usize = 0,
    };
}`,
  },
  {
    title: "Literals and switch",
    description: "0x/0b literals, enum, switch, \\\\ strings",
    code: `const Color = enum { red, green, blue };

const mask: u32 = 0xFF_00;
const flags: u8 = 0b1010_0101;

fn describe(c: Color) []const u8 {
    return switch (c) {
        .red => "warm",
        .green, .blue => "cool",
    };
}

const banner =
    \\\\Welcome
    \\\\to Zig
;`,
  },
  {
    title: "C interop with anyopaque",
    description: "anyopaque, the 0.10+ replacement for c_void",
    code: `const std = @import("std");

extern fn c_alloc(size: usize) *anyopaque;
extern fn c_free(ptr: *anyopaque) void;

fn withOpaqueHandle(handle: *anyopaque) void {
    const bytes: [*]u8 = @ptrCast(handle);
    std.debug.print("first byte: {d}\\n", .{bytes[0]});
}`,
  },
  {
    title: "Optional types",
    description: "?T optional prefix alongside !T error unions",
    code: `fn find(items: []const i32, target: i32) ?usize {
    for (items, 0..) |item, i| {
        if (item == target) return i;
    }
    return null;
}

fn describe(items: []const i32, target: i32) ![]const u8 {
    const index = find(items, target) orelse return error.NotFound;
    return if (index == 0) "first" else "found";
}`,
  },
];
