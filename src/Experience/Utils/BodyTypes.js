function pow2(x){
    return Math.pow(2, x);
}

const bodyTypes = {
    NONE : pow2(0),
    Boat : pow2(1),
    Kraken :pow2(2),
    BOMBS: pow2(3),
    OBSTACLES : pow2(4),
    PLACEHOLDER : pow2(5),
    OTHERS : pow2(20),
}

export default bodyTypes;