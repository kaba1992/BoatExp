function pow2(x){
    return Math.pow(2, x);
}

const bodyTypes = {
    NONE : pow2(0),
    GOODCRATES : pow2(1),
    BADCRATES : pow2(2),
    BOAT :pow2(3),
    ROCK: pow2(4),
    OTHERS : pow2(20),
}

export default bodyTypes;