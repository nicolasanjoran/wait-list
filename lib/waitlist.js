function timeoutPromise(ms) {
    return new Promise((_, reject) => setTimeout(reject, ms));
}

function waitlist() {
    return {
        waitingPromisesList : [],

        notifyNext() {
            let next = this.waitingPromisesList.pop()
            if (next) {
                next.resolve()
                return next.id
            }
            return null
        },
        notify(id) {
            let targets = this.waitingPromisesList.filter(it => it.id == id)
            if(targets) {
                for(var i = 0 ; i < targets.length ; i++) {
                    targets[i].resolve()
                }
                this.remove(id)
            }
        },
        remove(id) {
            this.waitingPromisesList = this.waitingPromisesList.filter(it => it.id !== id)
        },
        add(id, timeoutMs) {
            let waitingPromise = new Promise((resolve) => {
                let waitingObject = {
                    id,
                    resolve
                }
                this.waitingPromisesList.push(waitingObject)
            })
            if(timeoutMs) {
                return Promise.race([waitingPromise, timeoutPromise(timeoutMs)]).catch(() => {
                    this.remove(id)
                    return Promise.reject()
                })
            }
            return waitingPromise
        }
    }
}

module.exports = waitlist