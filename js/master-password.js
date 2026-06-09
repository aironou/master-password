class MasterPassword {
    static PASSWORD_UPDATED = 'PASSWORD_UPDATED';

    static #UPDATE_MPW = 'UPDATE_MPW';
    static #MPW_UPDATED = 'MPW_UPDATED';
    static #UPDATE_PASSWORD = 'UPDATE_PASSWORD';
    static #ACCEPTED_TYPES = [
        "maximum",
        "long",
        "medium",
        "basic",
        "short",
        "pin",
        "name",
        "phrase",
    ];

    #mpw = undefined;
    #name = undefined;
    #password = undefined;
    #site = undefined;
    #counter = 1;
    #type = undefined;

    constructor() {
        addEventListener(MasterPassword.#UPDATE_MPW, () => this.#updateMPW());
        addEventListener(MasterPassword.#MPW_UPDATED, () => this.#updatePassword());
        addEventListener(MasterPassword.#UPDATE_PASSWORD, () => this.#updatePassword());
    }

    setName(name) {
        if (typeof name !== 'string' || name.trim() === '') {
            return;
        }

        this.#name = name;
        dispatchEvent(new CustomEvent(MasterPassword.#UPDATE_MPW));
    }

    setPassword(password) {
        if (typeof password !== 'string' || password === '') {
            return;
        }

        this.#password = password;
        dispatchEvent(new CustomEvent(MasterPassword.#UPDATE_MPW));
    }

    setSite(site) {
        if (typeof site !== 'string' || site.trim() === '') {
            return;
        }

        this.#site = site;
        dispatchEvent(new CustomEvent(MasterPassword.#UPDATE_PASSWORD));
    }

    setCounter(counter) {
        counter = Number(counter);
        if (typeof counter !== 'number' || counter < 1 || counter > (Math.pow(2, 32) - 1)) {
            return;
        }

        this.#counter = counter;
        dispatchEvent(new CustomEvent(MasterPassword.#UPDATE_PASSWORD));
    }

    setType(type) {
        if (typeof type !== 'string' || ! MasterPassword.#ACCEPTED_TYPES.includes(type)) {
            return;
        }

        this.#type = type;
        dispatchEvent(new CustomEvent(MasterPassword.#UPDATE_PASSWORD));
    }

    #updateMPW() {
        console.debug('updating MPW');

        if (typeof this.#name === undefined || this.#password === undefined) {
            console.debug('MPW not updated', this.#name, this.#password);

            return;
        }

        this.#mpw = new MPW(this.#name, this.#password, '3');
        console.debug('MPW updated', this.#mpw);

        dispatchEvent(new CustomEvent(MasterPassword.#MPW_UPDATED));
    }

    #updatePassword() {
        console.debug('updating password');

        if (typeof this.#mpw === 'undefined' || typeof this.#site === 'undefined' || typeof this.#type === 'undefined') {
            console.debug('password not updated', this.#mpw, this.#site, this.#counter, this.#type);

            return;
        }

        this.#mpw.key.then(() => {
            this.#mpw.generatePassword(this.#site, this.#counter, this.#type).then((password) => {
                console.debug('password generated', password);

                dispatchEvent(new CustomEvent(MasterPassword.PASSWORD_UPDATED, {
                    detail: password,
                }));
            });
        });
    }
}

const masterPassword = new MasterPassword();

const name = document.querySelector('#name');
const password = document.querySelector('#password');
const site = document.querySelector('#site');
const counter = document.querySelector('#counter');
const type = document.querySelector('#type');

masterPassword.setCounter(counter.value);
masterPassword.setType(type.value);

name.addEventListener('change', (event) => masterPassword.setName(event.target.value));
password.addEventListener('change', (event) => masterPassword.setPassword(event.target.value));
site.addEventListener('input', (event) => masterPassword.setSite(event.target.value));
counter.addEventListener('input', (event) => masterPassword.setCounter(event.target.value));
type.addEventListener('change', (event) => masterPassword.setType(event.target.value));
addEventListener(MasterPassword.PASSWORD_UPDATED, (event) => {
    console.debug('updating generated_password', event);

    document.querySelector('#generated_password').innerHTML = event.detail;
});
