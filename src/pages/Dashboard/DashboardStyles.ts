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
    
    -webkit-appearance: none;
    margin: 0; 
}

input[type=number] {
    -moz-appearance:textfield; /* Firefox */
}
`