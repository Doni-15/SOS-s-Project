import assert from "node:assert/strict";
import test from "node:test";

import {
  createMenuImageFileName,
  inspectMenuImage,
} from "../../src/modules/upload/upload.service.js";

const pngFixture = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nH0AAAAASUVORK5CYII=",
  "base64"
);

test("menu upload accepts image content that matches the declared MIME type", async () => {
  const result = await inspectMenuImage({
    buffer: pngFixture,
    mimetype: "image/png",
  });

  assert.equal(result.mimeType, "image/png");
  assert.equal(result.extension, ".png");
  assert.equal(result.size, pngFixture.byteLength);
});

test("menu upload rejects non-image bytes with an image MIME header", async () => {
  await assert.rejects(
    inspectMenuImage({
      buffer: Buffer.from("#!/bin/sh\necho should-not-run\n"),
      mimetype: "image/png",
    }),
    (error) => error.code === "INVALID_IMAGE_CONTENT"
  );
});

test("menu upload rejects mismatched image content and MIME header", async () => {
  await assert.rejects(
    inspectMenuImage({
      buffer: pngFixture,
      mimetype: "image/jpeg",
    }),
    (error) => error.code === "INVALID_IMAGE_CONTENT"
  );
});

test("menu upload rejects buffers over the service limit", async () => {
  await assert.rejects(
    inspectMenuImage({
      buffer: Buffer.alloc(2 * 1024 * 1024 + 1),
      mimetype: "image/png",
    }),
    (error) => error.code === "IMAGE_TOO_LARGE"
  );
});

test("stored image names are random and ignore the client filename", () => {
  const first = createMenuImageFileName(".png");
  const second = createMenuImageFileName(".png");

  assert.match(first, /^menu-\d+-[0-9a-f-]{36}\.png$/);
  assert.notEqual(first, second);
});
