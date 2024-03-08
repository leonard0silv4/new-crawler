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

    .border.rounded-lg.p-2{
        @media(max-width: 768px){
        overflow: scroll;
    }    
    }

    @media(max-width: 768px){
        overflow: hidden;
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

export const ContainerLine = styled.li`
    display: flex;
    gap:10px;
    border-bottom:1px solid rgb(229, 229, 229);
    margin-bottom: 10px;
    padding: 20px 0;

    &.scrollAdjust{
        padding-right: 19px;

        @media(max-width: 768px){
            min-width:1200px;
        }

        > span{
            font-weight: bold ;
            
        }

        

    }

    > span{
        align-items: center;
        display: flex ;
        font-size: 14px;
    }

     > span:nth-child(1){
        
        width: 10%;
        display: flex ;
        align-items:center;
        justify-content: center
    }
    > span:nth-child(2){
        width: 38%;
        
        display: block ;
    }
    > span:nth-child(3){
        
        width: 10%;
        justify-content: center;
    }
    > span:nth-child(4){
        
        width: 10%;
        justify-content: center;
    }
    > span:nth-child(5){
        
        width: 10%;
        justify-content: center;
    }
    > span:nth-child(6){
        
        width: 12%;
        justify-content: center;
    }
    > span:nth-child(7){
        width: 8%;
        justify-content: center;
    }
    > span:nth-child(8){
        width: 8%;
        justify-content: center;
    }
`