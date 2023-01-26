function pow2(x){
    return Math.pow(2, x);
}

const bodyTypes = {
    NONE : pow2(0),
    BOAT :pow2(1),
    ROCK: pow2(2),
    OTHERS : pow2(20),
}

export default bodyTypes;