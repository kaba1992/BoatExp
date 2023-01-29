import Initializer from "three-nebula/build/cjs/initializer/Initializer"

export default class MeshInitializer extends Initializer {
  constructor(geometry) {
    super()
    this.geometry = null

    if (geometry.type && (geometry.type.endsWith("Geometry") || geometry.isBufferGeometry)) {
      this.geometry = geometry
    }

    if (geometry.geometry) {
      this.geometry = geometry.geometry
    }

    if (!this.geometry) {
      throw new Error("MeshZone unable to set geometry from the supplied bounds")
    }

    this.geometry.computeTangents()
    this.speed = 0.2
  }

  reset() {
    super.reset()

    this.geometry.computeTangents()
  }
}

MeshInitializer.prototype.initialize = (function () {
  return function (target) {
    const vertices = this.geometry.getAttribute("position")
    const tangents = this.geometry.getAttribute("tangent")

    const index = Math.floor(vertices.count * Math.random())

    const vector = index * vertices.itemSize
    const tangent = index * tangents.itemSize

    target.position.x = vertices.array[vector] + (Math.random() * 2 - 1) * 0
    target.position.y = vertices.array[vector + 1] + (Math.random() * 2 - 1) * 0
    target.position.z = vertices.array[vector + 2] + (Math.random() * 2 - 1) * 0

    target.velocity.x = tangents.array[tangent] * this.speed
    target.velocity.y = tangents.array[tangent + 1] * this.speed
    target.velocity.z = tangents.array[tangent + 2] * this.speed
  }
})()