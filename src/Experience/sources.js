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
        name: 'HyperlapsNoiseTexture',
        type: 'texture',
        path: 'textures/hyperlapsNoise.png'
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
        name: 'sharkModel',
        type: 'dracoLoader',
        path: 'models/Boat/SharkNew.glb'
    },
  
  
    // {
    //     name: 'rockModel1',
    //     type: 'gltfModel',
    //     path: 'models/Rock/Rock1.glb'
    // },
    // {
    //     name: 'rockModel2',
    //     type: 'gltfModel',
    //     path: 'models/Rock/Rock2.glb'
    // },
    {
        name: 'crateModel',
        type: 'dracoLoader',
        path: 'models/Crate/crate.glb'
    }
]