function pow2(x){
    return Math.pow(2, x);
}

const bodyTypes = {
    NONE : pow2(0),
    CRATES : pow2(1),
    BOAT :pow2(2),
    ROCK: pow2(3),
    OTHERS : pow2(20),
}

export default bodyTypes;