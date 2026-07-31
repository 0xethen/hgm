class gurt {
  id: number = 0;
  name?: string;
  static count = 0;

  constructor(name?: string) {
    if (name) this.name = name;
    this.id = gurt.count++;
  }

  yo(message?: string) {
    console.log(`${this.name || "gurt"} (${this.id}/${gurt.count}): ${message || "yo"}`);
  }
}

new gurt().yo();
