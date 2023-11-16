export default [
    {
        name: 'environmentMapTexture',
        type: 'cubeTexture',
        path:
            [
                'textures/environmentMap/px.jpg',
                'textures/environmentMap/nx.jpg',
                'textures/environmentMap/py.jpg',
                'textures/environmentMap/ny.jpg',
                'textures/environmentMap/pz.jpg',
                'textures/environmentMap/nz.jpg'
            ]
    },
    {
        name: 'grassColorTexture',
        type: 'texture',
        path: 'textures/dirt/color.jpg'
    },
    {
        name: 'grassNormalTexture',
        type: 'texture',
        path: 'textures/dirt/normal.jpg'
    },
    {
        name: 'exclamationMark',
        type: 'texture',
        path: 'textures/Sharks/exclamationMark.png'
    },
    {
        name: 'revealTexture',
        type: 'texture',
        path: 'textures/revealTest1.jpg'
    },

    {
        name: 'boatModel',
        type: 'dracoLoader',
        path: 'models/Boat/boatToon.glb'
    },
    {
        name: 'miniIslandModel',
        type: 'dracoLoader',
        path: 'models/Islands/miniIsland.glb'
    },
    {
        name: 'emptysModel',
        type: 'dracoLoader',
        path: 'models/Islands/Emptys.glb'
    },
    {
        name: 'volcanoModel',
        type: 'dracoLoader',
        path: 'models/Islands/Volcano.glb'
    },
    {
        name: 'sharkModel',
        type: 'dracoLoader',
        path: 'models/Boat/SharkNew.glb'
    },
    {
        name: 'fishModel',
        type: 'dracoLoader',
        path: 'models/Fish/the_fish_particle.glb'
    },
    {
        name: 'whaleModel',
        type: 'dracoLoader',
        path: 'models/Fish/Whale.glb'
    },


    {
        name: 'crateModel',
        type: 'dracoLoader',
        path: 'models/Crate/crateToon.glb'
    },
    {
        name: 'crateSlotModel',
        type: 'gltfModel',
        path: 'models/Crate/crateSlots.glb'
    }
]