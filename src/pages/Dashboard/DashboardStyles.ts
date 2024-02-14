import styled from 'styled-components';

export const Main = styled.div`
    .updated{
        background: rgb(30 183 30 / 16%);
    }

    tbody {
        tr{
            transition: all linear 0.75s;
        }
    }

    
`;


export const Link = styled.a`
    max-width: 350px;
    display: block;
`

export const InputCustom = styled.div`
    input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
    -moz-appearance:textfield; /* Firefox */
}
`