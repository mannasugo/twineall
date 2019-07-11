module.exports = {
  
  callFrame (mapping) {
    return this.ModelStringify(this.skeletal(mapping));
  }
}