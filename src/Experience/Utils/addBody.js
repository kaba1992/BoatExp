import * as CANNON from 'cannon-es'
import { threeToCannon, ShapeType } from 'three-to-cannon';

class AddBody {
    constructor() {

    }

    setBody(object, mass, options, world) {
        if (object.isObject3D) {
            // use threeToCannon to convert the object to a cannon shape with convexpolyhedron

            // const shape = threeToCannon(object);

            const { shape, offset, quaternion } = threeToCannon(object) || {};
            // create a cannon body with the shape

            const body = new CANNON.Body({

                mass: mass,
                shape: shape,
                position: offset,
                quaternion: quaternion,
                ...options
            });


            world.addBody(body)

            return body


        } else {
            if (object.geometry.type === 'BoxGeometry') {

                const body = new CANNON.Body({
                    mass: mass,
                    shape: new CANNON.Box(new CANNON.Vec3(object.geometry.parameters.width / 2, object.geometry.parameters.height / 2, object.geometry.parameters.depth / 2)),
                    position: new CANNON.Vec3(object.position.x, object.position.y, object.position.z),
                    ...options
                })
                world.addBody(body)
                return body
            }
            if (object.geometry.type === 'SphereGeometry') {
                const body = new CANNON.Body({
                    mass: mass,
                    shape: new CANNON.Sphere(object.geometry.parameters.radius),
                    position: new CANNON.Vec3(object.position.x, object.position.y, object.position.z),
                    ...options
                })
                world.addBody(body)
                return body
            }
            if (object.geometry.type === 'PlaneGeometry') {
                const body = new CANNON.Body({
                    mass: mass,
                    shape: new CANNON.Plane(),
                    position: new CANNON.Vec3(object.position.x, object.position.y, object.position.z),
                    ...options
                })
                world.addBody(body)
                return body
            }
            if (object.geometry.type === 'CylinderGeometry') {
                const body = new CANNON.Body({
                    mass: mass,
                    shape: new CANNON.Cylinder(object.geometry.parameters.radiusTop, object.geometry.parameters.radiusBottom, object.geometry.parameters.height, 32),
                    position: new CANNON.Vec3(object.position.x, object.position.y, object.position.z),
                    ...options
                })
                world.addBody(body)
                return body
            }
        }

    }
    setCustomBody(mass, options, world, { width, height, depth }) {
        // add box shape to object depending on the size of the object

        const body = new CANNON.Body({
            mass: mass,
            shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)),
            // position: new CANNON.Vec3(object.position.x, object.position.y, object.position.z),
            ...options

        })
        world.addBody(body)
        return body
    }
    update() {
    }
}
export default new AddBody()