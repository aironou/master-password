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
    #counter = undefined;
    #type = undefined;

    constructor() {
        addEventListener(MasterPassword.#UPDATE_MPW, () => this.#updateMPW());
        addEventListener(MasterPassword.#MPW_UPDATED, () => this.#updatePassword());
        addEventListener(MasterPassword.#UPDATE_PASSWORD, () => this.#updatePassword());
    }

    set name(name) {
        if (this.#name === name) {
            return;
        }

        this.#name = typeof name !== 'string' || name.trim() === '' ? undefined : name;
        dispatchEvent(new CustomEvent(MasterPassword.#UPDATE_MPW));
    }

    set password(password) {
        if (this.#password === password) {
            return;
        }

        this.#password = typeof password !== 'string' || password === '' ? undefined : password;
        dispatchEvent(new CustomEvent(MasterPassword.#UPDATE_MPW));
    }

    set site(site) {
        if (this.#site === site) {
            return;
        }

        this.#site = typeof site !== 'string' || site.trim() === '' ? undefined : site;
        dispatchEvent(new CustomEvent(MasterPassword.#UPDATE_PASSWORD));
    }

    set counter(counter) {
        counter = Number(counter);
        if (this.#counter === counter) {
            return;
        }

        this.#counter = typeof counter !== 'number' || counter < 1 || counter > (Math.pow(2, 32) - 1) ? undefined : counter;
        dispatchEvent(new CustomEvent(MasterPassword.#UPDATE_PASSWORD));
    }

    set type(type) {
        if (this.#type === type) {
            return;
        }

        this.#type = typeof type !== 'string' || ! MasterPassword.#ACCEPTED_TYPES.includes(type) ? undefined : type;
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
masterPassword.counter = counter.value;
masterPassword.type = type.value;

name.addEventListener('change', (event) => masterPassword.name = event.target.value);
password.addEventListener('change', (event) => masterPassword.password = event.target.value);
site.addEventListener('input', (event) => masterPassword.site = event.target.value);
counter.addEventListener('input', (event) => masterPassword.counter = event.target.value);
type.addEventListener('change', (event) => masterPassword.type = event.target.value);

    document.querySelector('#generated_password').innerHTML = event.detail;
});

addEventListener(MasterPassword.PASSWORD_UPDATED, async (event) => {
    console.debug('updating generated-password output', event);

    generatedPassword.textContent = event.detail;
})
