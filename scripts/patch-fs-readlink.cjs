/**
 * Remap EISDIR from fs.readlink → EINVAL.
 * Needed on exFAT/SD volumes where Node misreports ordinary files.
 * Must patch sync, callback, AND fs.promises — Next page workers use promises.
 */
const fs = require("node:fs");

function remap(error, path) {
  if (error && error.code === "EISDIR") {
    const remapped = new Error(
      `EINVAL: invalid argument, readlink '${String(path)}'`,
    );
    remapped.code = "EINVAL";
    remapped.path = error.path;
    return remapped;
  }
  return error;
}

const sync = fs.readlinkSync.bind(fs);
fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    return sync(path, options);
  } catch (error) {
    throw remap(error, path);
  }
};

const asyncFn = fs.readlink.bind(fs);
fs.readlink = function patchedReadlink(path, optionsOrCb, maybeCb) {
  const cb = typeof optionsOrCb === "function" ? optionsOrCb : maybeCb;
  const options = typeof optionsOrCb === "function" ? undefined : optionsOrCb;

  if (typeof cb !== "function") {
    return asyncFn(path, optionsOrCb);
  }

  return asyncFn(path, options, (error, linkString) => {
    cb(remap(error, path) || null, linkString);
  });
};

if (fs.promises && typeof fs.promises.readlink === "function") {
  const promiseReadlink = fs.promises.readlink.bind(fs.promises);
  fs.promises.readlink = async function patchedPromiseReadlink(path, options) {
    try {
      return await promiseReadlink(path, options);
    } catch (error) {
      throw remap(error, path);
    }
  };
}
