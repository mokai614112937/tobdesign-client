function charWidth (v,width,suffix='...'){
  if(width <= 0){
    return v
  }
  if( !!v && v.length >width ){
    v = v.substr(0,width)+suffix
  }
  return v
}
export default charWidth
