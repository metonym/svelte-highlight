export type CythonPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const cythonPreviewSnippets: CythonPreviewSnippet[] = [
  {
    title: "Typed memoryview kernel",
    description:
      "a cpdef function over 2D memoryviews, compiler directives, and a nogil loop",
    code: `# cython: language_level=3
cimport cython
from libc.math cimport exp


@cython.boundscheck(False)
@cython.wraparound(False)
cpdef void softmax_rows(double[:, ::1] x, double[:, ::1] out) noexcept nogil:
    cdef Py_ssize_t i, j
    cdef Py_ssize_t n = x.shape[0], m = x.shape[1]
    cdef double row_max, total

    for i in range(n):
        row_max = x[i, 0]
        for j in range(1, m):
            if x[i, j] > row_max:
                row_max = x[i, j]
        total = 0.0
        for j in range(m):
            out[i, j] = exp(x[i, j] - row_max)
            total += out[i, j]
        for j in range(m):
            out[i, j] /= total`,
  },
  {
    title: "Wrapping a C library",
    description:
      "cdef extern from a header, a ctypedef struct, and an extension type that owns a C pointer",
    code: `cdef extern from "ringbuf.h":
    ctypedef struct ringbuf_t:
        size_t capacity
        size_t head
        size_t tail
    ringbuf_t* ringbuf_new(size_t capacity)
    void ringbuf_free(ringbuf_t* rb)
    int ringbuf_push(ringbuf_t* rb, const char* data, size_t n) nogil


cdef class RingBuffer:
    cdef ringbuf_t* _rb
    cdef readonly size_t capacity

    def __cinit__(self, size_t capacity):
        self._rb = ringbuf_new(capacity)
        if self._rb is NULL:
            raise MemoryError()
        self.capacity = capacity

    def __dealloc__(self):
        if self._rb is not NULL:
            ringbuf_free(self._rb)

    cpdef int push(self, bytes data) except -1:
        cdef const char* buf = <const char*>data
        cdef size_t n = len(data)
        cdef int rc
        with nogil:
            rc = ringbuf_push(self._rb, buf, n)
        if rc != 0:
            raise OverflowError("ring buffer is full")
        return 0`,
  },
  {
    title: "Fused types and a .pxd declaration file",
    description:
      "a fused type for generic code, a packed struct, and cdef inline helpers",
    code: `# geometry.pxd
ctypedef fused real:
    float
    double

cdef packed struct Vec3:
    float x
    float y
    float z

cdef inline real clamp(real v, real lo, real hi) noexcept nogil:
    if v < lo:
        return lo
    if v > hi:
        return hi
    return v

cdef inline double dot(Vec3* a, Vec3* b) noexcept nogil:
    return <double>(a.x * b.x + a.y * b.y + a.z * b.z)

cdef class Mesh:
    cdef Vec3* vertices
    cdef public Py_ssize_t count
    cpdef double area(self) except? -1.0`,
  },
  {
    title: "Callback with the GIL",
    description:
      "a C callback that reacquires the GIL to call back into Python",
    code: `cdef extern from "events.h":
    ctypedef void (*event_cb)(int code, void* ctx) noexcept
    void events_listen(event_cb cb, void* ctx) nogil


cdef void on_event(int code, void* ctx) noexcept with gil:
    handler = <object>ctx
    try:
        handler(code)
    except Exception as exc:
        print(f"handler failed: {exc!r}")


def listen(handler):
    with nogil:
        events_listen(on_event, <void*>handler)`,
  },
];
